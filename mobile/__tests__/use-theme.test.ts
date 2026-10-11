import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

jest.mock('@/hooks/use-color-scheme');

test.each([
  ['light', Colors.light],
  ['dark', Colors.dark],
  ['unspecified', Colors.light],
] as const)('uses the expected theme when the device scheme is %s', async (scheme, colors) => {
  jest.mocked(useColorScheme).mockReturnValue(scheme);
  const { result } = await renderHook(() => useTheme());
  expect(result.current).toEqual(colors);
});
