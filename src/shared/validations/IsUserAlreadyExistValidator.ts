import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { getRepository } from 'typeorm';
import { User } from 'src/modules/entity/user.entity';

/**
 * Check if user already registerd validator
 */
@ValidatorConstraint()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email: email } });

    if (user) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'User with provided email already registered.';
  }
}

@ValidatorConstraint()
export class IsUserAlreadyPhoneNumber implements ValidatorConstraintInterface {
  async validate(phone_number: string, args: ValidationArguments) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { phone_number: phone_number } });

    if (user) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'User with provided phone number already registered.';
  }
}
