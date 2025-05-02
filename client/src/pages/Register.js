import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { REGISTER_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const RegisterContainer = styled.div`
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

const LoginLink = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Numele este obligatoriu'),
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
              name: values.name,
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

  return (
    <RegisterContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Înregistrare</h2>
      
      {serverError && (
        <ErrorText style={{ marginBottom: '1rem' }}>{serverError}</ErrorText>
      )}
      
      <Form onSubmit={formik.handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Nume</Label>
          <Input
            id="name"
            name="name"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            placeholder="Introdu numele tău"
          />
          {formik.touched.name && formik.errors.name ? (
            <ErrorText>{formik.errors.name}</ErrorText>
          ) : null}
        </FormGroup>

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

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirmă parola</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            placeholder="Confirmă parola"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <ErrorText>{formik.errors.confirmPassword}</ErrorText>
          ) : null}
        </FormGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Se procesează...' : 'Înregistrare'}
        </SubmitButton>
      </Form>

      <LoginLink>
        Ai deja cont? <Link to="/login">Autentifică-te</Link>
      </LoginLink>
    </RegisterContainer>
  );
};

export default Register;