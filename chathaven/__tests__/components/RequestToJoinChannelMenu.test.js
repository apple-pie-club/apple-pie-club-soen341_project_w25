import '@testing-library/jest-dom'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import RequestToJoinChannelMenu from '../../src/components/RequestToJoinChannelMenu'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ _id: '1', email: 'email@test.com', firstname: 'firstname', lastname: 'lastname', isGlobalAdmin: false }])
  })
)

describe('RequestToJoinChannelMenu', () => {
  test('displays the available channels in the dropdown', async () => {
    const mockTeamChannels = [
      { _id: 'channel1', name: 'Channel 1' },
      { _id: 'channel2', name: 'Channel 2' }
    ]

    const mockUserChannels = [
      { _id: 'channel3', name: 'Channel 3' }
    ]

    global.fetch = jest.fn((url) => {
      if (url.includes('/api/team-channels')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTeamChannels)
        })
      } else if (url.includes('/api/user-channels')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockUserChannels)
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    await act(async () => {
      render(<RequestToJoinChannelMenu
        isOpen
        selectedTeam={{ _id: 'team1' }}
        userId='user1'
        onClose={() => {}}
             />)
    })

    await waitFor(() => {
      const dropdown = screen.getByRole('combobox')
      expect(dropdown).toBeInTheDocument()
      expect(screen.getByText('-- Select a channel --')).toBeInTheDocument()
      expect(screen.getByText('Channel 1')).toBeInTheDocument()
      expect(screen.getByText('Channel 2')).toBeInTheDocument()
      expect(screen.queryByText('Channel 3')).not.toBeInTheDocument()
    })
  })

  test('submits a request when confirm button is clicked', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve([{ _id: 'channel1', name: 'Channel 1' }])
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve([])
      }))
      .mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({ success: true })
      }))

    global.alert = jest.fn()

    const handleClose = () => {}

    await act(async () => {
      render(<RequestToJoinChannelMenu
        isOpen
        selectedTeam={{ _id: 'team1' }}
        userId='user1'
        onClose={handleClose}
             />)
    })

    await waitFor(() => {
      const dropdown = screen.getByRole('combobox')
      fireEvent.change(dropdown, { target: { value: 'channel1' } })
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }))
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/channel-requests', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: 'channel1', teamId: 'team1' })
      })

      expect(global.alert).toHaveBeenCalledWith('The request has been sent to the channel admin.')
    })
  })

  test('renders nothing when the menu is closed', async () => {
    await act(async () => {
      render(<RequestToJoinChannelMenu isOpen={false} />)
    })

    expect(document.body).toMatchInlineSnapshot(`
            <body>
              <div />
            </body>
          `)
  })
})
