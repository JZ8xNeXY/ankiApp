import {render, screen,waitFor,fireEvent} from '@testing-library/react-native';
import FlashcardScreen from '../src/app/memo/flashcardScreen';
import React from 'react';
import {faker} from '@faker-js/faker';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

const front = 'question:' + faker.lorem.sentence(); 
const back = 'answer:' + faker.lorem.sentence();  

const mockFlashcard = {
  id: faker.string.uuid(),
  data: () => ({
    front: front,  
    back: back, 
    repetition: faker.number.int({ min: 1, max: 5 }),
    interval: faker.number.int({ min: 1, max: 30 }),
    efactor: faker.number.float({ min: 1.3, max: 2.5}),
    nextReview: { toDate: () => faker.date.soon() },
    createdAt: { toDate: () => faker.date.recent() },
  }),
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(() => new Date()),
    now: jest.fn(() => new Date()),
  },
  getDocs: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ docs: [mockFlashcard] })),
}));

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('../src/config', () => ({
  auth: { currentUser: { uid: 'test-user' } },
  db: {},
}));

describe('FlashcardScreen', () => {
  it('should display message when flashcards are empty', async () => {

    (jest.requireMock('firebase/firestore').getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });
    render(<FlashcardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Decks')).toBeTruthy();
      expect(screen.getByText('Add')).toBeTruthy();
      expect(screen.getByText(/新しいカードを\s*\s*追加してみましょう/)).toBeTruthy();
    });
  });
  
  it('should render question flashcardScreen correctly', async () => {
    render(<FlashcardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Decks')).toBeTruthy();
      expect(screen.getByText('Add')).toBeTruthy()
      expect(screen.getByText('Edit')).toBeTruthy()
      expect(screen.getByText('Delete')).toBeTruthy()
      expect(screen.getByText(front)).toBeTruthy()
      expect(screen.getByText('Show Answer')).toBeTruthy()
      screen.debug()
    });
  });

  it('should render answer flashcardScreen correctly', async () => {
    render(<FlashcardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Show Answer')).toBeTruthy();
    });
    
    fireEvent.press(screen.getByText('Show Answer'));
    
    await waitFor(() => {
      expect(screen.getByText(back)).toBeTruthy();
      expect(screen.getByText(/1m\s*\s*Again/)).toBeTruthy();
      expect(screen.getByText(/10m\s*\s*Good/)).toBeTruthy();
      expect(screen.getByText(/4d\s*\s*Easy/)).toBeTruthy();
    });
    });
});