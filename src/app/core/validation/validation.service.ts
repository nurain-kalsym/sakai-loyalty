import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors } from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class ValidationService {
    constructor(private _httpClient: HttpClient) {}

    static phonenumberValidator(control) {

        if(control.value === null){
            return null;
        }

        if (
            control.value.toString().match(
                /[2-9]{1}\d{10}/
            )
        ) {
            return null;
        } else {
            return { invalidPhonenumber: true };
        }

    }

    static numberOnlyValidator(control: AbstractControl): { [key: string]: any } | null {
        if (!control.value) {
            return null;  // If value is empty, let other validators (like required) handle it
        }
    
        // Check if the input value consists of only numbers
        if (/^\d+$/.test(control.value.toString())) {
            return null;  // Valid input (only numbers)
        } else {
            return { invalidNumber: true };  // Invalid input (contains non-numeric characters)
        }
    }
    
    

    static serviceNameValidator(control) {
        const value = control.value;
    
        if (value === null || value === '') {
          return null;  // No validation error if the value is null or an empty string
        }
    
        // Check if the input value consists of only alphabets and spaces
        const regex = /^[a-zA-Z0-9\s]+$/;
        if (regex.test(value)) {
          return null;  // Valid input (only alphabets and spaces)
        } else {
          return { invalidServiceName: true };  // Invalid input (contains non-alphabetic characters or non-spaces)
        }
    }

    static conversionRateValidator(control) {
        if (control.value === null || control.value === '') {
            return null;  // No validation error if the value is null or an empty string
        }
    
        // Check if the input value is a valid number (whole or decimal)
        if (control.value.toString().match(/^\d+(\.\d+)?$/)) {
            return null;  // Valid input (only numbers)
        } else {
            return { invalidRate: true };  // Invalid input (contains non-numeric characters)
        }
    }

    static numbersDecimalValidator(control) {
        if (control.value === null || control.value === '') {
            return null;  // No validation error if the value is null or an empty string
        }
        
        // Convert the value to a string and trim any leading or trailing whitespace
        const valueStr = control.value.toString().trim();
        
        // Regular expression to match integers or decimal numbers
        const numberPattern = /^-?\d*(\.\d+)?$/;
        
        // Check if the input value matches the pattern
        if (numberPattern.test(valueStr)) {
            return null;  // Valid input (numbers including decimals)
        } else {
            return { invalidType: true };  // Invalid input (contains non-numeric characters)
        }
    }
}