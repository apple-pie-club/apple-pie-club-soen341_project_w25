import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import HomePage from '../../src/app/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ _id: "1", firstname: "firstname", lastname: "lastname", isGlobalAdmin: false }),
  })
);

describe('HomePage', () => {
  test('renders the home page with the correct heading', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    const heading = screen.getByRole('heading', { level: 1, name: /ChatHaven/i });

    expect(heading).toBeInTheDocument();
  });

  test('renders the home page navigation buttons', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });
});
