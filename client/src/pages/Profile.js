import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { GET_USER_PROFILE } from '../graphql/queries';
import { UPDATE_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary-color);
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
    line-height: 1.5;
  }
`;

const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.75rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }
`;

const SectionTitle = styled.h2`
  color: var(--primary-color);
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: var(--primary-color);
    border-radius: 3px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

// Componenta ToggleSwitch pentru un buton de comutare mai robust
const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

const SwitchControl = styled.div`
  position: relative;
  width: 54px;
  height: 28px;
  background-color: ${props => props.checked ? 'var(--primary-color)' : 'var(--switch-inactive)'};
  border-radius: 14px;
  transition: background-color 0.3s;
  
  &:hover {
    box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);
  }
`;

const SwitchButton = styled.div`
  position: absolute;
  top: 4px;
  left: ${props => props.checked ? 'calc(100% - 24px)' : '4px'};
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const SwitchLabel = styled.span`
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
`;

const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <SwitchContainer onClick={() => onChange(!checked)}>
      <SwitchControl checked={checked}>
        <SwitchButton checked={checked} />
      </SwitchControl>
      <SwitchLabel>{label}</SwitchLabel>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
    </SwitchContainer>
  );
};

const SaveButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    font-size: 1.25rem;
    font-weight: 700;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.25rem;
  color: #4a5568;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Profile = () => {
  const { updateUser } = useAuth();
  const [success, setSuccess] = useState(false);
  
  const { loading, error, data } = useQuery(GET_USER_PROFILE);
  const [updateUserProfile, { loading: updateLoading }] = useMutation(UPDATE_USER);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      preferences: {
        notifications: true,
        reminderTime: '20:00',
        theme: 'light'
      }
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Prenumele este obligatoriu'),
      lastName: Yup.string().required('Numele de familie este obligatoriu'),
      email: Yup.string().email('Adresa de email invalidă').required('Email-ul este obligatoriu'),
      preferences: Yup.object({
        notifications: Yup.boolean(),
        reminderTime: Yup.string(),
        theme: Yup.string().oneOf(['light', 'dark', 'auto'])
      })
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await updateUserProfile({
          variables: { input: values }
        });
        
        // Actualizează utilizatorul în context
        updateUser(data.updateUser);
        
        // Aplicăm imediat tema selectată
        applyTheme(values.preferences.theme);
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error('Eroare la actualizarea profilului:', error);
      }
    },
    enableReinitialize: true
  });

  // Completează formularul cu datele utilizatorului când acestea sunt disponibile
  useEffect(() => {
    if (data && data.me) {
      formik.setValues({
        firstName: data.me.firstName || '',
        lastName: data.me.lastName || '',
        email: data.me.email || '',
        preferences: {
          notifications: data.me.preferences?.notifications !== undefined 
            ? data.me.preferences.notifications 
            : true,
          reminderTime: data.me.preferences?.reminderTime || '20:00',
          theme: data.me.preferences?.theme || 'light'
        }
      });
    }
  }, [data]);

  // Funcție pentru aplicarea temei
  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-color', '#1a202c');
      root.style.setProperty('--text-color', '#f7fafc');
      root.style.setProperty('--card-bg', '#2d3748');
      root.style.setProperty('--border-color', '#4a5568');
    } else if (theme === 'light') {
      root.style.setProperty('--bg-color', '#f7fafc');
      root.style.setProperty('--text-color', '#2d3748');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border-color', '#e2e8f0');
    } else if (theme === 'auto') {
      // Verifică preferința de sistem
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDarkMode) {
        root.style.setProperty('--bg-color', '#1a202c');
        root.style.setProperty('--text-color', '#f7fafc');
        root.style.setProperty('--card-bg', '#2d3748');
        root.style.setProperty('--border-color', '#4a5568');
      } else {
        root.style.setProperty('--bg-color', '#f7fafc');
        root.style.setProperty('--text-color', '#2d3748');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--border-color', '#e2e8f0');
      }
    }
  };

  // Aplică tema inițială la încărcarea paginii
  useEffect(() => {
    if (data && data.me && data.me.preferences) {
      applyTheme(data.me.preferences.theme || 'light');
    }
  }, [data]);

  if (loading) return <LoadingContainer>Se încarcă datele profilului...</LoadingContainer>;
  if (error) return (
    <ProfileContainer>
      <ErrorText>Eroare la încărcarea profilului: {error.message}</ErrorText>
    </ProfileContainer>
  );

  return (
    <ProfileContainer>
      <PageHeader>
        <h1>Profilul meu</h1>
        <p>Personalizează setările contului tău și preferințele aplicației ZenPath.</p>
      </PageHeader>
      
      {success && (
        <SuccessMessage>
          Profilul a fost actualizat cu succes!
        </SuccessMessage>
      )}
      
      {data && data.me && (
        <Form onSubmit={formik.handleSubmit}>
          <Card>
            <SectionTitle>Editează profilul</SectionTitle>
            
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
              />
              {formik.touched.email && formik.errors.email ? (
                <ErrorText>{formik.errors.email}</ErrorText>
              ) : null}
            </FormGroup>
          </Card>
          
          <Card>
            <SectionTitle>Preferințe</SectionTitle>
            
            <FormGroup>
              <ToggleSwitch
                checked={formik.values.preferences.notifications}
                onChange={(value) => formik.setFieldValue('preferences.notifications', value)}
                label="Notificări"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="preferences.reminderTime">Ora pentru notificări</Label>
              <Input
                id="preferences.reminderTime"
                name="preferences.reminderTime"
                type="time"
                onChange={formik.handleChange}
                value={formik.values.preferences.reminderTime}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="preferences.theme">Temă</Label>
              <Select
                id="preferences.theme"
                name="preferences.theme"
                onChange={formik.handleChange}
                value={formik.values.preferences.theme}
              >
                <option value="light">Luminoasă</option>
                <option value="dark">Întunecată</option>
                <option value="auto">Automat (urmează setarea sistemului)</option>
              </Select>
            </FormGroup>
            
            <SaveButton type="submit" disabled={updateLoading || !formik.dirty}>
              {updateLoading ? 'Se salvează...' : 'Salvează modificările'}
            </SaveButton>
          </Card>
        </Form>
      )}
    </ProfileContainer>
  );
};

export default Profile;