import { ConflictException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import CredentialsDto from './dto/credentials.dto';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async register(registerDto: RegisterDto): Promise<CredentialsDto> {
        const foundUser = await this.usersService.findOneByEmail(registerDto.email);

        if (foundUser) {
            throw new ConflictException();
        }

        const createdUser = await this.usersService.create(registerDto);

        if (!createdUser) {
            throw new HttpException('Something went wrong', 400);
        }

        return this.getUserCredentials(createdUser.id, createdUser.firstName, createdUser.lastName, createdUser.email, createdUser.createdAt ?? new Date());
    }

    async login(loginDto: LoginDto): Promise<CredentialsDto> {
        const user = await this.usersService.findOneByEmail(loginDto.email);

        if (!user) {
            throw new NotFoundException();
        }

        const doesPasswordMatch = await bcrypt.compare(loginDto.password, user.password);

        if (!doesPasswordMatch) {
            throw new UnauthorizedException();
        }

        return this.getUserCredentials(user.id, user.firstName, user.lastName, user.email, user.createdAt ?? new Date());
    }

    async getUserCredentials(id: string, firstName: string, lastName: string, email: string, createdAt: Date): Promise<CredentialsDto> {
        const payload = { sub: id, username: email };

        return {
            id,
            access_token: await this.jwtService.signAsync(payload),
            firstName,
            lastName,
            email,
            createdAt
        };
    }
}
