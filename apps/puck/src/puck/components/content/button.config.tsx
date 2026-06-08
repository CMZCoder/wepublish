import { ComponentConfig } from '@puckeditor/core';

import { UserFields } from '../../types';
import { Button } from '@mui/material';
import { AlignmentValue } from '../../plugins/alignment';

export const ButtonConfig: ComponentConfig<{
  props: {
    text: string;
    alignment?: AlignmentValue;
  };
  fields: UserFields;
}> = {
  inline: true,
  fields: {
    text: {
      type: 'text',
      contentEditable: true,
    },
    alignment: {
      type: 'alignment',
    },
  },
  defaultProps: {
    text: 'Hello, world',
  },

  render: ({ text, alignment }) => (
    <Button
      variant="contained"
      css={{ textAlign: alignment }}
    >
      {text}
    </Button>
  ),
};
