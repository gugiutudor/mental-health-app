import React, { useState } from 'react';
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
  padding: 0 1rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
`;

const SwitchContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const Switch = styled.div`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: ${props => props.checked ? '#4c51bf' : '#cbd5e0'};
  border-radius: 9999px;
  transition: background-color 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 0.25rem;
    left: ${props => props.checked ? '1.75rem' : '0.25rem'};
    width: 1rem;
    height: 1rem;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const SaveButton = styled.button`
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

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: #ebf4ff;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #4c51bf;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
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
        theme: 'auto'
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
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error('Eroare la actualizarea profilului:', error);
      }
    },
    enableReinitialize: true
  });

  // Completează formularul cu datele utilizatorului când acestea sunt disponibile
  React.useEffect(() => {
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
          theme: data.me.preferences?.theme || 'auto'
        }
      });
    }
  }, [data]);

  if (loading) return <ProfileContainer><p>Se încarcă datele profilului...</p></ProfileContainer>;
  if (error) return <ProfileContainer><p>Eroare la încărcarea profilului: {error.message}</p></ProfileContainer>;

  // Formatarea datei
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  return (
    <ProfileContainer>
      <h1>Profilul meu</h1>
      
      {success && (
        <SuccessMessage>
          Profilul a fost actualizat cu succes!
        </SuccessMessage>
      )}
      
      {data && data.me && (
        <>
          <Card>
            <StatsGrid>
              <StatCard>
                <StatValue>{data.me.streak || 0}</StatValue>
                <StatLabel>Zile consecutive</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>
                  {formatDate(data.me.dateJoined)}
                </StatValue>
                <StatLabel>Membru din</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>
                  {data.me.lastActive ? formatDate(data.me.lastActive) : 'Astăzi'}
                </StatValue>
                <StatLabel>Ultima activitate</StatLabel>
              </StatCard>
            </StatsGrid>
          </Card>
          
          <Card>
            <h2 style={{ marginBottom: '1.5rem' }}>Editează profilul</h2>
            
            <Form onSubmit={formik.handleSubmit}>
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
              
              <FormGroup>
                <Label>Preferințe</Label>
                
                <FormGroup style={{ marginLeft: '1rem' }}>
                  <SwitchContainer>
                    <input
                      id="preferences.notifications"
                      name="preferences.notifications"
                      type="checkbox"
                      checked={formik.values.preferences.notifications}
                      onChange={formik.handleChange}
                      style={{ display: 'none' }}
                    />
                    <Switch checked={formik.values.preferences.notifications} />
                    <span>Notificări</span>
                  </SwitchContainer>
                </FormGroup>
                
                <FormGroup style={{ marginLeft: '1rem' }}>
                  <Label htmlFor="preferences.reminderTime">Ora pentru notificări</Label>
                  <Input
                    id="preferences.reminderTime"
                    name="preferences.reminderTime"
                    type="time"
                    onChange={formik.handleChange}
                    value={formik.values.preferences.reminderTime}
                  />
                </FormGroup>
                
                <FormGroup style={{ marginLeft: '1rem' }}>
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
              </FormGroup>
              
              <SaveButton type="submit" disabled={updateLoading || !formik.dirty}>
                {updateLoading ? 'Se salvează...' : 'Salvează modificările'}
              </SaveButton>
            </Form>
          </Card>
        </>
      )}
    </ProfileContainer>
  );
};

export default Profile;