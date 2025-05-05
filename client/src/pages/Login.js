import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LOGIN_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import { 
  FormContainer, 
  Form, 
  TextField, 
  PasswordField, 
  SubmitButton, 
  ErrorMessage,
  LinkText
} from '../components/forms/FormComponents';

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
    <FormContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Autentificare</h2>
      
      {serverError && (
        <ErrorMessage>{serverError}</ErrorMessage>
      )}
      
      <Form onSubmit={formik.handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          error={formik.errors.email}
          touched={formik.touched.email}
          placeholder="Introdu adresa de email"
        />

        <PasswordField
          id="password"
          label="Parolă"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={formik.errors.password}
          touched={formik.touched.password}
          placeholder="Introdu parola"
        />

        <SubmitButton loading={loading}>
          Autentificare
        </SubmitButton>
      </Form>

      <LinkText>
        Nu ai cont? <Link to="/register">Înregistrează-te</Link>
      </LinkText>
    </FormContainer>
  );
};

export default Login;