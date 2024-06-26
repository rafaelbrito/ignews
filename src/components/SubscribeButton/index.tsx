import { signIn, useSession } from 'next-auth/react';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string;
}
export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const { data: session, status } = useSession()
    function handleSubscribe() {
        if (status === 'authenticated') {
            signIn('github')
            return;
        }
        
    }
    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe Now
        </button>
    );
}
