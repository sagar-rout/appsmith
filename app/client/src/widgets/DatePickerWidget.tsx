import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "./BaseWidget";
import { WidgetType } from "constants/WidgetConstants";
import { EventType } from "constants/ActionConstants";
import DatePickerComponent from "components/designSystems/blueprint/DatePickerComponent";
import {
  WidgetPropertyValidationType,
  BASE_WIDGET_VALIDATION,
} from "utils/WidgetValidation";
import { VALIDATION_TYPES } from "constants/WidgetValidation";
import {
  DerivedPropertiesMap,
  TriggerPropertiesMap,
} from "utils/WidgetFactory";
import * as Sentry from "@sentry/react";
import withMeta, { WithMeta } from "./MetaHOC";
import moment from "moment";

class DatePickerWidget extends BaseWidget<DatePickerWidgetProps, WidgetState> {
  static getPropertyValidationMap(): WidgetPropertyValidationType {
    return {
      ...BASE_WIDGET_VALIDATION,
      defaultDate: VALIDATION_TYPES.DEFAULT_DATE,
      timezone: VALIDATION_TYPES.TEXT,
      enableTimePicker: VALIDATION_TYPES.BOOLEAN,
      dateFormat: VALIDATION_TYPES.TEXT,
      label: VALIDATION_TYPES.TEXT,
      datePickerType: VALIDATION_TYPES.TEXT,
      maxDate: VALIDATION_TYPES.MAX_DATE,
      minDate: VALIDATION_TYPES.MIN_DATE,
      isRequired: VALIDATION_TYPES.BOOLEAN,
      // onDateSelected: VALIDATION_TYPES.ACTION_SELECTOR,
      // onDateRangeSelected: VALIDATION_TYPES.ACTION_SELECTOR,
    };
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
      isValid: `{{ this.isRequired ? !!this.selectedDate : true }}`,
      value: `{{ this.selectedDate }}`,
    };
  }

  static getTriggerPropertyMap(): TriggerPropertiesMap {
    return {
      onDateSelected: true,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      selectedDate: "defaultDate",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedDate: undefined,
    };
  }

  componentDidUpdate(prevProps: DatePickerWidgetProps) {
    if (this.props.dateFormat !== prevProps.dateFormat) {
      if (this.props.defaultDate) {
        const defaultDate = moment(
          this.props.defaultDate,
          this.props.dateFormat,
        );
        if (!defaultDate.isValid()) {
          super.updateWidgetProperty("defaultDate", "");
        } else {
          if (this.props.minDate) {
            const minDate = moment(this.props.minDate, this.props.dateFormat);
            if (!minDate.isValid() || defaultDate.isBefore(minDate)) {
              super.updateWidgetProperty("defaultDate", "");
            }
          }
          if (this.props.maxDate) {
            const maxDate = moment(this.props.maxDate, this.props.dateFormat);
            if (!maxDate.isValid() || defaultDate.isAfter(maxDate)) {
              super.updateWidgetProperty("defaultDate", "");
            }
          }
        }
      }
    }
  }

  getPageView() {
    return (
      <DatePickerComponent
        label={`${this.props.label}`}
        dateFormat={this.props.dateFormat}
        widgetId={this.props.widgetId}
        isDisabled={this.props.isDisabled}
        datePickerType={"DATE_PICKER"}
        onDateSelected={this.onDateSelected}
        selectedDate={this.props.selectedDate}
        isLoading={this.props.isLoading}
        minDate={this.props.minDate}
        maxDate={this.props.maxDate}
      />
    );
  }

  onDateSelected = (selectedDate: string) => {
    this.props.updateWidgetMetaProperty("selectedDate", selectedDate, {
      dynamicString: this.props.onDateSelected,
      event: {
        type: EventType.ON_DATE_SELECTED,
      },
    });
  };

  getWidgetType(): WidgetType {
    return "DATE_PICKER_WIDGET";
  }
}

export type DatePickerType = "DATE_PICKER" | "DATE_RANGE_PICKER";

export interface DatePickerWidgetProps extends WidgetProps, WithMeta {
  defaultDate: string;
  selectedDate: string;
  isDisabled: boolean;
  dateFormat: string;
  label: string;
  datePickerType: DatePickerType;
  onDateSelected?: string;
  onDateRangeSelected?: string;
  maxDate: string;
  minDate: string;
  isRequired?: boolean;
}

export default DatePickerWidget;
export const ProfiledDatePickerWidget = Sentry.withProfiler(
  withMeta(DatePickerWidget),
);
