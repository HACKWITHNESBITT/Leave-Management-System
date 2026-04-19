<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;

class VerifyEmailNotification extends BaseVerifyEmail
{
    protected function verificationUrl($notifiable)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        
        $temporarySignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // We extract the query and path to build a frontend URL
        $urlParts = parse_url($temporarySignedUrl);
        $queryParams = $urlParts['query'];

        return $frontendUrl . '/verify-email?' . $queryParams . '&id=' . $notifiable->getKey() . '&hash=' . sha1($notifiable->getEmailForVerification());
    }
}
