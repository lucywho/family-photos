import { getAlbumsWithPhotoCount } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default async function AlbumAdmin() {
  const albums = await getAlbumsWithPhotoCount();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between mb-4'>
        <Button variant='default' size='sm'>
          <Plus className='h-4 w-4 mr-2' />
          Add New Album
        </Button>
      </div>
      <div className='rounded-md border divide-y divide-border'>
        {albums.map((album) => (
          <div key={album.id} className='flex items-center justify-between p-4'>
            <div>
              <span className='font-medium'>{album.name}</span>
              <span className='ml-2 text-muted-foreground text-sm'>
                ({album._count.photos} photos)
              </span>
            </div>
            {album.name !== 'All Photos' && (
              <div className='flex flex-row'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Delete Album'
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete album: {album.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this album? Deleting an
                        album cannot be undone. Your photos will remain in the
                        'All Photos' album.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction /* onClick={handleDelete(album.id)} */>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label='Rename Album'
                    >
                      <Edit className='h-4 w-4 text-text' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Rename album: {album.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to rename this album?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction /* onClick={handleEdit(album.id)} */>
                        Rename
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
