// FormComponents.js corectat pentru a evita și avertizarea hasError
import React, { useState } from 'react';
import styled from 'styled-components';

export const FormContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
`;

// Folosim transient props (cu $) pentru a preveni ca acestea să ajungă în DOM
export const Input = styled.input.attrs(props => ({
  // Excludem explicit atributele noastre personalizate
  // din cele transmise către DOM
}))`
  padding: 0.75rem;
  border: 1px solid ${props => props.$hasError ? '#e53e3e' : '#e2e8f0'};
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4c51bf;
    box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export const TextArea = styled.textarea.attrs(props => ({
  // Excludem explicit atributele noastre personalizate
}))`
  padding: 0.75rem;
  border: 1px solid ${props => props.$hasError ? '#e53e3e' : '#e2e8f0'};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4c51bf;
    box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export const Select = styled.select.attrs(props => ({
  // Excludem explicit atributele noastre personalizate
}))`
  padding: 0.75rem;
  border: 1px solid ${props => props.$hasError ? '#e53e3e' : '#e2e8f0'};
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4c51bf;
    box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.1);
  }
`;

export const Button = styled.button`
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

export const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
`;

export const SuccessText = styled.div`
  color: #2f855a;
  font-size: 0.875rem;
`;

export const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

export const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

export const LinkText = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: #4a5568;
  font-size: 0.875rem;

  a {
    color: #4c51bf;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }

  label {
    font-size: 0.875rem;
    cursor: pointer;
  }
`;

export const PasswordInput = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding-right: 2.5rem;
  }
  
  button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #4c51bf;
    }
  }
`;

// Componenta pentru câmpul de parolă cu vizibilitate toggle
export const PasswordField = ({ id, label, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Extragem error și touched din props pentru a evita transmiterea lor către DOM
  const { error, touched, ...inputProps } = props;
  const hasError = error && touched;
  
  return (
    <FormGroup>
      <Label htmlFor={id}>{label}</Label>
      <PasswordInput>
        <Input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          $hasError={hasError} // Folosim $ pentru a marca ca proprietate transient în styled-components
          {...inputProps}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </PasswordInput>
      {hasError && (
        <ErrorText>{error}</ErrorText>
      )}
    </FormGroup>
  );
};

// Componenta pentru câmpul de text
export const TextField = ({ id, label, ...props }) => {
  // Extragem error și touched din props pentru a evita transmiterea lor către DOM
  const { error, touched, ...inputProps } = props;
  const hasError = error && touched;
  
  return (
    <FormGroup>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        $hasError={hasError} // Folosim $ pentru a marca ca proprietate transient în styled-components
        {...inputProps}
      />
      {hasError && (
        <ErrorText>{error}</ErrorText>
      )}
    </FormGroup>
  );
};

// Componenta pentru butonul de submit
export const SubmitButton = ({ children, loading, ...props }) => {
  return (
    <Button type="submit" disabled={loading} {...props}>
      {loading ? 'Se procesează...' : children}
    </Button>
  );
};