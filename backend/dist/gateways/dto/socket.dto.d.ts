export declare class SubscribeDto {
    topic: string;
    type: string;
    params?: Record<string, any>;
}
export declare class SubscribeResponseDto {
    success: boolean;
    message?: string;
    topic?: string;
}
export declare class UnsubscribeDto {
    topic: string;
}
export declare class UnsubscribeResponseDto {
    success: boolean;
    message?: string;
}
