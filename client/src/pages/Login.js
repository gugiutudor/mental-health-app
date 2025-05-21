import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LOGIN_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, rgba(244, 244, 255, 0.5) 0%, rgba(228, 248, 255, 0.5) 100%);
`;

const LoginCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  
  span {
    color: var(--secondary-color);
  }
`;

const FormTitle = styled.h2`
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const PasswordInput = styled(Input)`
  padding-right: 2.5rem;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 1.25rem;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ServerError = styled.div`
  background-color: #fed7d7;
  color: #e53e3e;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
`;

const LinksContainer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  
  a {
    color: var(--primary-color);
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
      color: var(--primary-hover);
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loginUser, { loading }] = useMutation(LOGIN_USER);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Adresa de email invalidă')
        .required('Adresa de email este obligatorie'),
      password: Yup.string()
        .required('Parola este obligatorie')
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await loginUser({
          variables: {
            input: {
              email: values.email,
              password: values.password
            }
          }
        });

        login(data.login.user, data.login.token);
        navigate('/');
      } catch (error) {
        setServerError(error.message || 'A apărut o eroare la autentificare');
      }
    }
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>Zen<span>Path</span></Logo>
        
        <FormTitle>Autentificare</FormTitle>
        
        {serverError && (
          <ServerError>{serverError}</ServerError>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="Introdu adresa de email"
            />
            {formik.touched.email && formik.errors.email ? (
              <ErrorText>{formik.errors.email}</ErrorText>
            ) : null}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Parolă</Label>
            <PasswordInputWrapper>
              <PasswordInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                placeholder="Introdu parola"
              />
              <PasswordToggleButton 
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggleButton>
            </PasswordInputWrapper>
            {formik.touched.password && formik.errors.password ? (
              <ErrorText>{formik.errors.password}</ErrorText>
            ) : null}
          </FormGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Se procesează...' : 'Autentificare'}
          </LoginButton>
        </form>

        <LinksContainer>
          <p>Nu ai cont? <Link to="/register">Înregistrează-te</Link></p>
        </LinksContainer>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;