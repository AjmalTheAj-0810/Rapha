// Test script to verify registration flow fixes
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import RegisterForm from './src/components/auth/RegisterForm';
import PersonalInformation from './src/pages/PersonalInformation';

// Mock API service
jest.mock('./src/services/api.js', () => ({
  register: jest.fn().mockResolvedValue({
    token: 'mock-token',
    user: { id: 1, user_type: 'physiotherapist', email: 'test@example.com' }
  }),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 1,
    user_type: 'physiotherapist',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe'
  })
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Registration Flow', () => {
  test('should show certificate upload for physiotherapist', async () => {
    const { rerender } = render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    // Fill registration form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'physio@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'TestPass123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'TestPass123!' }
    });
    fireEvent.change(screen.getByDisplayValue(''), {
      target: { value: 'physiotherapist' }
    });

    // Submit registration form
    fireEvent.click(screen.getByText('Register'));

    // Should navigate to personal information page
    rerender(
      <TestWrapper>
        <PersonalInformation />
      </TestWrapper>
    );

    // Check if certificate upload field is visible for physiotherapist
    await waitFor(() => {
      expect(screen.getByText('Upload Certificate or License')).toBeInTheDocument();
    });
  });

  test('should not show certificate upload for patient', async () => {
    const { rerender } = render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    );

    // Fill registration form for patient
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'patient@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'TestPass123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'TestPass123!' }
    });
    fireEvent.change(screen.getByDisplayValue(''), {
      target: { value: 'patient' }
    });

    // Submit registration form
    fireEvent.click(screen.getByText('Register'));

    // Should navigate to personal information page
    rerender(
      <TestWrapper>
        <PersonalInformation />
      </TestWrapper>
    );

    // Check if certificate upload field is NOT visible for patient
    await waitFor(() => {
      expect(screen.queryByText('Upload Certificate or License')).not.toBeInTheDocument();
    });
  });
});

console.log('Registration flow test script created successfully!');