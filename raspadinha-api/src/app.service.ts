import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      name: 'Raspadinha',
      version: '1.0.0',
      author: 'Berlim'
    };
  }
}
