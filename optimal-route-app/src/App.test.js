import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the destination chooser without external Google Maps requests', async () => {
  vi.stubGlobal('google', { maps: {} });
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Choose Your Destination' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Seoul' })).toBeInTheDocument();
});
