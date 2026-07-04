import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'ValidateId', async: false })
export class ValidateId implements ValidatorConstraintInterface {
  validate(value: string[], args: ValidationArguments) {
  

    return value.filter(id=>Types.ObjectId.isValid(id)).length ==value.length
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `some of id is invalid`;
  }
}

