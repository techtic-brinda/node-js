import { becrypt } from "src/common/utils";

export const data = [
  {
    name: 'super admin',
    email: 'admin@gmail.com',
    password: becrypt("admin@123"),
    role: 'Super Admin'
  },
  {
    name: 'Auditor',
    email: 'auditor@gmail.com',
    password: becrypt("test@123"),
    role: 'Auditor'
  },
];
