import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LOGIN_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
`;

const SubmitButton = styled.button`
  background-color: #4c51bf;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #434190;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

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

  return (
    <LoginContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Autentificare</h2>
      
      {serverError && (
        <ErrorText style={{ marginBottom: '1rem' }}>{serverError}</ErrorText>
      )}
      
      <Form onSubmit={formik.handleSubmit}>
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
          <Input
            id="password"
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            placeholder="Introdu parola"
          />
          {formik.touched.password && formik.errors.password ? (
            <ErrorText>{formik.errors.password}</ErrorText>
          ) : null}
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Se procesează...' : 'Autentificare'}
        </SubmitButton>
      </Form>

      <RegisterLink>
        Nu ai cont? <Link to="/register">Înregistrează-te</Link>
      </RegisterLink>
    </LoginContainer>
  );
};

export default Login;