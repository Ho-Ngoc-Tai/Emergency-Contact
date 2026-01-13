import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            fullName: string;
            phoneNumber: string | null;
            id: string;
            subscriptionStatus: string;
            createdAt: Date;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            phoneNumber: string | null;
            subscriptionStatus: string;
        };
        token: string;
    }>;
}
