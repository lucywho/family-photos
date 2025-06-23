import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface CancelAlertProps {
  showConfirmModal: boolean;
  setShowConfirmModal: (show: boolean) => void;
  onCancel: () => void;
}

export function CancelAlert({
  showConfirmModal,
  setShowConfirmModal,
  onCancel,
}: CancelAlertProps) {
  return (
    <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
      <AlertDialogContent className='bg-background border-destructive'>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to discard them?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant='secondary' className='my-0 mr-4'>
              Continue editing
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              className='my-4'
              onClick={() => {
                setShowConfirmModal(false);
                onCancel();
              }}
            >
              Discard changes
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
