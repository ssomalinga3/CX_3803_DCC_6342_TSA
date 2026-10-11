import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';

test('the starter disclosure opens and closes through its accessible button', async () => {
  const user = userEvent.setup();
  await render(
    <Collapsible title="Setup information">
      <Text>Development build instructions</Text>
    </Collapsible>,
  );

  const button = screen.getByRole('button', { name: 'Setup information' });
  expect(button).toBeCollapsed();
  expect(screen.queryByText('Development build instructions')).not.toBeOnTheScreen();

  await user.press(button);
  expect(button).toBeExpanded();
  expect(screen.getByText('Development build instructions')).toBeOnTheScreen();

  await user.press(button);
  expect(button).toBeCollapsed();
  expect(screen.queryByText('Development build instructions')).not.toBeOnTheScreen();
});
