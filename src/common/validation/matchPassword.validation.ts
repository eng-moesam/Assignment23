import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'IsMatch', async: false })
export class MatchTwoFields implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    // value: input value #confriom password
    //args.object['password'] value of password input
    
    return value == args.object[args.constraints[0]]; // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `value of ${args.property} not match ${args.constraints[0]}`;
  }
}

export function IsMatch(constraints:string[],validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: MatchTwoFields,
    });
  };
}