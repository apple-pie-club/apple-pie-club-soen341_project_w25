import '@testing-library/jest-dom'
import { userEvent } from '@testing-library/user-event'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import CMsWindow from '../../src/components/CMsWindow'

const user = userEvent.setup()

jest.mock('react-webcam', () => {
  return {
    __esModule: true,
    default: function MockWebcam () {
      return (
        <div data-testid='mock-webcam' />
      )
    }
  }
})

jest.mock('emoji-picker-react', () => {
  return {
    __esModule: true,
    default: function MockEmojiPicker () {
      return (
        <div data-testid='mock-emoji-picker' />
      )
    }
  }
})

global.fetch = jest.fn()

describe('CMsWindow', () => {
  const mockSelectedTeam = { _id: '1', teamName: 'testTeam' }
  const mockSelectedChannel = {
    _id: '1',
    name: 'testChannel',
    members: ['1111', '2222']
  }
  const messageAreaClass = 'testClass'
  const mockOnLeaveChannel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch.mockImplementation((url) => {
      if (url === '/api/users') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { _id: '1111', email: 'email@test.com', firstname: 'testFirstname', lastname: 'testLastname', isGlobalAdmin: false, isChannelAdmin: [{}] },
            { _id: '2222', email: 'email@test.com', firstname: 'testFirstname2', lastname: 'testLastname2', isGlobalAdmin: false, isChannelAdmin: [{}] }
          ])
        })
      } else if (url === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ _id: '3333', email: 'email@test.com', firstname: 'testFirstname', lastname: 'testLastname', isGlobalAdmin: false, isChannelAdmin: [{}] })
        })
      } else if (url.includes('/api/channelsmessages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { _id: 'msg1', sender: '1111', text: 'first test message', reactions: { '👍': 2 } },
            { _id: 'msg2', sender: '2222', text: 'second test message' }
          ])
        })
      }
      return Promise.resolve({ ok: false })
    })

    Element.prototype.scrollIntoView = jest.fn()
  })

  test('fetches and displays messages when channel is selected', async () => {
    render(
      <CMsWindow
        selectedTeam={mockSelectedTeam}
        selectedChannel={mockSelectedChannel}
        messageAreaClass={messageAreaClass}
        onLeaveChannel={mockOnLeaveChannel}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('first test message')).toBeInTheDocument()
      expect(screen.getByText('second test message')).toBeInTheDocument()
    })
  })

  test('sends a message', async () => {
    global.fetch.mockImplementation((url, options) => {
      if (url === '/api/channelsmessages' && options.method === 'POST') {
        const body = JSON.parse(options.body)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            newMessage: {
              _id: 'newMsg',
              sender: '1111',
              text: body.text
            }
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    })

    render(
      <CMsWindow
        selectedTeam={mockSelectedTeam}
        selectedChannel={mockSelectedChannel}
        messageAreaClass={messageAreaClass}
        onLeaveChannel={mockOnLeaveChannel}
      />
    )

    await waitFor(() => {
      const inputElement = screen.getByPlaceholderText('Type a message...')
      expect(inputElement).toBeInTheDocument()
    })

    const inputElement = screen.getByPlaceholderText('Type a message...')

    fireEvent.change(inputElement, { target: { value: 'Test message' } })
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/channelsmessages',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test message')
        })
      )
    })
  })

  test('opens emoji picker when emoji button is clicked', async () => {
    render(
      <CMsWindow
        selectedTeam={mockSelectedTeam}
        selectedChannel={mockSelectedChannel}
        messageAreaClass={messageAreaClass}
        onLeaveChannel={mockOnLeaveChannel}
      />
    )

    const emojiButton = screen.getByTitle('Emoji Picker')
    fireEvent.click(emojiButton)

    await waitFor(() => {
      expect(screen.getByTestId('mock-emoji-picker')).toBeInTheDocument()
    })
  })

  test('opens channel member list when its clicked', async () => {
    render(
      <CMsWindow
        selectedTeam={mockSelectedTeam}
        selectedChannel={mockSelectedChannel}
        messageAreaClass={messageAreaClass}
        onLeaveChannel={mockOnLeaveChannel}
      />
    )

    const memberListButton = screen.getByTitle('Channel Members')
    fireEvent.click(memberListButton)

    await waitFor(() => {
      expect(screen.getByText('testFirstname testLastname')).toBeInTheDocument()
      expect(screen.getByText('testFirstname2 testLastname2')).toBeInTheDocument()
    })
  })

  test('sets reply when reply button is clicked on a message', async () => {
    render(
      <CMsWindow
        selectedTeam={mockSelectedTeam}
        selectedChannel={mockSelectedChannel}
        messageAreaClass={messageAreaClass}
        onLeaveChannel={mockOnLeaveChannel}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('first test message')).toBeInTheDocument()
    })

    const messageElement = screen.getByText('first test message').closest('.message')
    fireEvent.mouseEnter(messageElement)

    const replyButtons = document.querySelectorAll('.replyButton')
    expect(replyButtons.length).toBeGreaterThan(0)

    fireEvent.click(replyButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Replying to/)).toBeInTheDocument()
    })
  })

  test('opens camera when camera button is clicked', async () => {
    render(
      <CMsWindow
        selectedTeam={mockSelectedTeam}
        selectedChannel={mockSelectedChannel}
        messageAreaClass={messageAreaClass}
        onLeaveChannel={mockOnLeaveChannel}
      />
    )

    const cameraButton = screen.getByTitle('Open Camera')
    fireEvent.click(cameraButton)

    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })
  })

  test('displays default message when no team is selected', async () => {
    await act(async () => {
      render(
        <CMsWindow
          selectedTeam={null}
          selectedChannel={null}
          messageAreaClass={messageAreaClass}
          onLeaveChannel={mockOnLeaveChannel}
        />
      )
    })

    expect(screen.getByText('Select a team to get started.')).toBeInTheDocument()
  })

  test('attempting to send a blank message is ignored', async () => {
    await act(async () => {
      render(
        <CMsWindow
          selectedTeam={null}
          selectedChannel={null}
          messageAreaClass={messageAreaClass}
          onLeaveChannel={mockOnLeaveChannel}
        />
      )
    })

    await act(async () => {
      await user.keyboard('{Enter}')
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
