import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { REGISTER_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, rgba(244, 244, 255, 0.5) 0%, rgba(228, 248, 255, 0.5) 100%);
`;

const RegisterCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
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

const RegisterButton = styled.button`
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

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required('Prenumele este obligatoriu'),
      lastName: Yup.string()
        .required('Numele de familie este obligatoriu'),
      email: Yup.string()
        .email('Adresa de email invalidă')
        .required('Adresa de email este obligatorie'),
      password: Yup.string()
        .min(6, 'Parola trebuie să aibă cel puțin 6 caractere')
        .required('Parola este obligatorie'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Parolele trebuie să coincidă')
        .required('Confirmarea parolei este obligatorie')
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await registerUser({
          variables: {
            input: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              password: values.password
            }
          }
        });

        login(data.register.user, data.register.token);
        navigate('/');
      } catch (error) {
        setServerError(error.message || 'A apărut o eroare la înregistrare');
      }
    }
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>Zen<span>Path</span></Logo>
        
        <FormTitle>Înregistrare</FormTitle>
        
        {serverError && (
          <ServerError>{serverError}</ServerError>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">Prenume</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
                placeholder="Introdu prenumele tău"
              />
              {formik.touched.firstName && formik.errors.firstName ? (
                <ErrorText>{formik.errors.firstName}</ErrorText>
              ) : null}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Nume de familie</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
                placeholder="Introdu numele de familie"
              />
              {formik.touched.lastName && formik.errors.lastName ? (
                <ErrorText>{formik.errors.lastName}</ErrorText>
              ) : null}
            </FormGroup>
          </FormRow>

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

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirmă parola</Label>
            <PasswordInputWrapper>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                placeholder="Confirmă parola"
              />
              <PasswordToggleButton 
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? 'Ascunde parola' : 'Arată parola'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggleButton>
            </PasswordInputWrapper>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <ErrorText>{formik.errors.confirmPassword}</ErrorText>
            ) : null}
          </FormGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Se procesează...' : 'Înregistrare'}
          </RegisterButton>
        </form>

        <LinksContainer>
          <p>Ai deja cont? <Link to="/login">Autentifică-te</Link></p>
        </LinksContainer>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;