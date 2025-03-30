import { render, screen,waitFor } from '@testing-library/react-native';
import DeckScreen from '../src/app/memo/deckScreen';
import React from 'react';

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: 'test-deck-id',
          data: () => ({
            name: 'Test Deck',
            createdAt: { toDate: () => new Date() },
            cardCount: 2,
            totalCount: 3, 
          }),

        },
      ],
    })
  ),
  deleteDoc: jest.fn(),
  Timestamp: {
    fromDate: () => new Date(),
    now: () => new Date(),
  },
  query: jest.fn(),
  where: jest.fn(),
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

      expect(screen.getByText('Log Out')).toBeTruthy();
      expect(screen.getByText(/NaN\s*\/\s*（完了）/)).toBeTruthy();
      expect(screen.getByText(' Action ▼')).toBeTruthy();
      expect(screen.getByText('Add Deck')).toBeTruthy();
      screen.debug()
    });
  });
});