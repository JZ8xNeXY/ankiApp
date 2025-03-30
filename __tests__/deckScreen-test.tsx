import { render, screen,waitFor } from '@testing-library/react-native';
import DeckScreen from '../src/app/memo/deckScreen';
import React from 'react';

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(() => Promise.resolve()),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  collection: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(() => new Date()),
    now: jest.fn(() => new Date()),
  },
}));

jest.mock('../src/config', () => ({
  auth: { currentUser: { uid: 'test-user' } },
  db: {},
}));

beforeAll(() => {
  process.env.EXPO_OS = 'ios'; 
});

describe('DeckScreen', () => {
  it('should render correctly', async () => {
    render(<DeckScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Deck')).toBeTruthy();
      expect(screen.getByText('Log Out')).toBeTruthy();
    });
  });
});