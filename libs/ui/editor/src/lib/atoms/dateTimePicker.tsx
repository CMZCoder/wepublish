import 'react-datepicker/dist/react-datepicker.css';

import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { MdInfo } from 'react-icons/md';
import { Button, Form, IconButton, Popover as RPopover, Whisper } from 'rsuite';

export interface DateTimePreset {
  label: string;
  offset: number;
}

export interface DateTimePickerProps {
  dateTime: Date | undefined;
  label: string;
  changeDate(publishDate: Date | undefined): void;

  dateRanges?: DateTimePreset[];
  timeRanges?: DateTimePreset[];
  helpInfo?: string;
  disabled?: boolean;
}

const Header = styled.div`
  margin: 5px auto;
`;

const Popover = styled(RPopover)`
  max-width: 300px;
`;

const PresetsButton = styled(Button)`
  min-width: 0;
  overflow: hidden;
  padding: 4px 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const Presets = styled.div`
  clear: both;
  display: grid;
  gap: 6px;
  padding: 8px 5px 0;
`;

const PresetRow = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
`;

export function DateTimePicker({
  dateTime,
  label,
  changeDate,
  dateRanges,
  timeRanges,
  helpInfo,
  disabled,
}: DateTimePickerProps) {
  const { t } = useTranslation();

  const [dateSelection, setDateSelection] = useState<Date | null>(
    dateTime ?? null
  );

  useEffect(() => {
    setDateSelection(dateTime ?? null);
  }, [dateTime]);

  const dateButtonPresets = dateRanges ?? [
    { label: t('dateTimePicker.today'), offset: 0 },
    { label: t('dateTimePicker.tomorrow'), offset: 1 },
    {
      label: t('dateTimePicker.nextMonday'),
      offset: new Date().getDay() === 1 ? 7 : (1 - new Date().getDay() + 7) % 7,
    },
    {
      label: t('dateTimePicker.nextSaturday'),
      offset: 6 - new Date().getDay(),
    },
  ];

  const timeButtonPresets = timeRanges ?? [
    { label: t('dateTimePicker.now'), offset: 0 },
    { label: t('dateTimePicker.hour', { hour: '5' }), offset: 5 },
    { label: t('dateTimePicker.hour', { hour: '14' }), offset: 14 },
  ];

  const handleDatePresetButton = (offset: number) => {
    const day = new Date();
    if (dateSelection) {
      day.setHours(dateSelection.getHours());
      day.setMinutes(dateSelection.getMinutes());
    }
    day.setDate(day.getDate() + offset);
    setDateSelection(day);
    changeDate(day);
  };

  const handleTimePresetButton = (hour: number) => {
    const day = dateSelection ? new Date(dateSelection) : new Date();
    if (hour === 0) {
      const now = new Date();
      day.setHours(now.getHours());
      day.setMinutes(now.getMinutes());
      setDateSelection(day);
      changeDate(day);
    } else {
      day.setHours(hour, 0, 0);
      setDateSelection(day);
      changeDate(day);
    }
  };

  return (
    <>
      <Global
        styles={css`
          .wepublish-date-time-picker-popper {
            padding-top: 0;
            z-index: 1060;
          }

          .react-datepicker.wepublish-date-time-picker {
            background: #fff;
            border: 1px solid #d9d9e3;
            border-radius: 8px;
            box-shadow: 0 14px 34px rgb(22 28 45 / 16%);
            color: darkgray;
            font-family: arial;
            min-width: 390px;
            padding: 10px;

            .react-datepicker__header {
              background-color: transparent;
              border-bottom: none;
            }

            .react-datepicker__navigation {
              height: 70px;
              width: 66px;
            }

            .react-datepicker__time-container {
              border: 1px solid #e5e5ea;
              border-radius: 7px;
              box-shadow: none;
              margin-bottom: 5px;
              margin-left: 10px;
              overflow: hidden;
              width: 90px;
            }

            .react-datepicker__time-box {
              width: 90px !important;
            }

            .react-datepicker__month-container {
              padding: 5px;
              width: 260px;
            }

            .react-datepicker__day-name {
              color: #8e8e99;
            }

            .react-datepicker__day-names {
              border: none;
            }

            .react-datepicker__day:not(.react-datepicker__day--selected):hover {
              background-color: #f2faff;
            }

            .react-datepicker__today-button {
              background-color: transparent;
              color: #216ba5;
            }

            .react-datepicker__today-button:hover {
              text-decoration: underline;
            }

            .react-datepicker__current-month,
            .react-datepicker-time__header,
            .react-datepicker-year-header {
              color: #8e8e99;
              font-weight: unset;
            }

            .react-datepicker__close-icon::after {
              padding: unset;
            }

            .react-datepicker__input-container {
              margin-bottom: 10px;
              width: unset;

              input {
                background-color: white;
                border: 1px solid #e5e5ea;
                border-radius: 5px;
                outline: none;
                padding: 7px;

                &:hover,
                &:focus-visible {
                  border: 1px solid #1675e0;
                  transition: border-color 0.3s;
                }
              }
            }

            .react-datepicker__children-container {
              margin: 0;
              padding: 0;
              width: 100%;
            }
          }

          .wepublish-date-time-picker
            .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item {
            &:not(&--selected) {
              color: #000;
              &:hover {
                background-color: #f2faff;
              }
            }
          }
        `}
      />
      <Header>
        <Form.ControlLabel>{label}</Form.ControlLabel>
        {helpInfo ?
          <Whisper
            placement="right"
            trigger="hover"
            controlId="control-id-hover"
            speaker={
              <Popover>
                <p>{helpInfo}</p>
              </Popover>
            }
          >
            <IconButton
              icon={<MdInfo />}
              circle
              size="xs"
            />
          </Whisper>
        : ''}
      </Header>
      <DatePicker
        disabled={disabled}
        isClearable
        showPopperArrow
        shouldCloseOnSelect={false}
        selected={dateSelection}
        onChange={value => {
          setDateSelection(value instanceof Date ? value : null);
          changeDate(value instanceof Date ? value : undefined);
        }}
        dateFormat="Pp"
        showTimeSelect
        calendarClassName="wepublish-date-time-picker"
        popperClassName="wepublish-date-time-picker-popper"
      >
        <Presets>
          <PresetRow>
            {dateButtonPresets.map((datePreset, i) => (
              <PresetsButton
                key={i}
                size="xs"
                onClick={() => handleDatePresetButton(datePreset.offset)}
              >
                {datePreset.label}
              </PresetsButton>
            ))}
          </PresetRow>
          <PresetRow>
            {timeButtonPresets.map((timePreset, i) => (
              <PresetsButton
                key={i}
                size="xs"
                onClick={() => handleTimePresetButton(timePreset.offset)}
              >
                {timePreset.label}
              </PresetsButton>
            ))}
          </PresetRow>
        </Presets>
      </DatePicker>
    </>
  );
}
