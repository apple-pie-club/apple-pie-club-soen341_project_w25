import '@testing-library/jest-dom'
import { render, screen, act, fireEvent } from '@testing-library/react'
import HomePage from '../../src/app/page'

const mockNextNavigation = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockNextNavigation
  })
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ _id: '1', email: 'email@test.com', firstname: 'testFirstname', lastname: 'testLastname', isGlobalAdmin: false })
      })
    )
  })

  test('navigates to the dashboard when Dashboard is clicked', async () => {
    await act(async () => {
      render(<HomePage />)
    })

    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))

    expect(mockNextNavigation).toHaveBeenCalledWith('/dashboard')
  })

  test('navigates to the DMs page when DMs is clicked', async () => {
    await act(async () => {
      render(<HomePage />)
    })

    fireEvent.click(screen.getByRole('button', { name: /dms/i }))

    expect(mockNextNavigation).toHaveBeenCalledWith('/dms')
  })

  test('navigates to the register page when Register is clicked', async () => {
    await act(async () => {
      render(<HomePage />)
    })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    expect(mockNextNavigation).toHaveBeenCalledWith('/register')
  })

  test('renders the home page with the correct heading', async () => {
    await act(async () => {
      render(<HomePage />)
    })

    const heading = screen.getByRole('heading', { level: 1, name: /ChatHaven/i })

    expect(heading).toBeInTheDocument()
  })

  test('renders the home page navigation buttons', async () => {
    await act(async () => {
      render(<HomePage />)
    })

    expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dms/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
    expect(screen.getByTestId('logout-button')).toBeInTheDocument()
  })
})
