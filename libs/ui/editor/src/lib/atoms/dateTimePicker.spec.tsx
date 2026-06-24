import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DateTimePicker } from './dateTimePicker';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { hour?: string }) => {
      const labels: Record<string, string> = {
        'dateTimePicker.today': 'Today',
        'dateTimePicker.tomorrow': 'Tomorrow',
        'dateTimePicker.nextMonday': 'Next Monday',
        'dateTimePicker.nextSaturday': 'Next Saturday',
        'dateTimePicker.now': 'Now',
      };

      if (key === 'dateTimePicker.hour') return `${options?.hour}:00`;

      return labels[key] ?? key;
    },
  }),
}));

describe('DateTimePicker', () => {
  it('opens a styled publish-date popover with usable preset controls', async () => {
    render(
      <DateTimePicker
        dateTime={new Date('2026-06-23T21:40:00.000Z')}
        label="Publish Date"
        changeDate={jest.fn()}
      />
    );

    await userEvent.click(screen.getByRole('textbox'));

    expect(
      document.querySelector('.wepublish-date-time-picker-popper')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '14:00' })).toBeInTheDocument();
  });
});
