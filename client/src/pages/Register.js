import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { REGISTER_USER } from '../graphql/mutations';
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
    <FormContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Înregistrare</h2>
      
      {serverError && (
        <ErrorMessage>{serverError}</ErrorMessage>
      )}
      
      <Form onSubmit={formik.handleSubmit}>
        <TextField
          id="name"
          label="Nume"
          type="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          error={formik.errors.name}
          touched={formik.touched.name}
          placeholder="Introdu numele tău"
        />

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

        <PasswordField
          id="confirmPassword"
          label="Confirmă parola"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
          error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
          placeholder="Confirmă parola"
        />

        <SubmitButton loading={loading}>
          Înregistrare
        </SubmitButton>
      </Form>

      <LinkText>
        Ai deja cont? <Link to="/login">Autentifică-te</Link>
      </LinkText>
    </FormContainer>
  );
};

export default Register;