import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { fieldClass } from '@/components/ui/FormField';

interface Props extends InputHTMLAttributes<HTMLInputElement> { error?: string }
const PasswordInput = forwardRef<HTMLInputElement, Props>(({ error, className, ...rest }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={show ? 'text' : 'password'} className={fieldClass(error, `pr-12 ${className ?? ''}`)} {...rest} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink/55 hover:text-ink">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
