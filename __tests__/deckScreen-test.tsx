import { faker } from '@faker-js/faker'
import { render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import DeckScreen from '../src/app/memo/deckScreen'

const mockTotalCount = faker.number.int({ min: 1, max: 10 })
const mockReviewedCount = faker.number.int({ min: 0, max: mockTotalCount })
const mockDeckName = faker.lorem.words(2)
const mockCreatedAt = faker.date.recent()
const mockDeckId = faker.string.uuid()

const mockDeckData = {
  id: mockDeckId,
  data: () => ({
    name: mockDeckName,
    createdAt: { toDate: () => mockCreatedAt },
  }),
}

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    fromDate: () => new Date(),
    now: () => new Date(),
  },
  getDocs: jest
    .fn()
    .mockImplementationOnce(() => Promise.resolve({ docs: [mockDeckData] }))
    .mockImplementationOnce(() => Promise.resolve({ size: mockTotalCount }))
    .mockImplementationOnce(() => Promise.resolve({ size: mockReviewedCount })),
}))

jest.mock('../src/config', () => ({
  auth: { currentUser: { uid: 'test-user' } },
  db: {},
}))

beforeAll(() => {
  process.env.EXPO_OS = 'ios'
})

describe('DeckScreen', () => {
  it('should render deck info correctly', async () => {
    render(<DeckScreen />)

    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeTruthy()
      expect(screen.getByText(mockDeckData.data().name)).toBeTruthy()
      expect(
        screen.getByText(
          `${mockTotalCount - mockReviewedCount} / ${mockTotalCount}（完了）`,
        ),
      ).toBeTruthy()
      expect(screen.getByText(' Action ▼')).toBeTruthy()
      expect(screen.getByText('Add Deck')).toBeTruthy()

      // screen.debug()
    })
  })
})
