import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { getRepository } from "typeorm";
import { User } from "src/modules/entity/user.entity";
/**
* Email match validator
*/
@ValidatorConstraint()
export class EmailMatch implements ValidatorConstraintInterface {

    async validate(email: string, args: ValidationArguments) {
        const userRepository = getRepository(User);
        //const user = await userRepository.findOne({ where: [{ email: email }] });
        const user = await userRepository.findOne({
            where: {email: email},
            relations: ['roles']
        });
        if (user) { 
            let role = user.roles ? user.roles[0] : null;
            if(role && role.name != 'Admin' || role.name != 'Super Admin' ){
                return true;
            }else{
                return false;
            }
        };
        return false;
    }

    // here you can provide default error message if validation failed
    defaultMessage(args: ValidationArguments) {
        return "There wasn't an account for that email.";
    }
}
