import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function AtLeastOne(requriedFildes:string[],validationOptions?: ValidationOptions) {
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      propertyName: "",
      options: validationOptions,
      constraints:requriedFildes,
      validator: {
  validate(value: string, args: ValidationArguments) {
    // value: input value #confriom password
    //args.object['password'] value of password input
    
    return  requriedFildes.some((field)=>{return args.object[field]})// for async validations you must return a Promise<boolean> here


//     return requriedFildes.some((field) => {
//   const value = args.object[field];
//   return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
// });
  },

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `At Least one Requried Fields {${requriedFildes.join(" , ")}} is missing `;
  }
    }, 
   })
  };
}