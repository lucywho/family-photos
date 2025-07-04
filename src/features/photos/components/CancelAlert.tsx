import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui';

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
            <Button className='mr-4 w-full bg-primary text-text'>
              Continue editing
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              className='my-4 w-full bg-destructive/80 text-background hover:bg-destructive'
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
