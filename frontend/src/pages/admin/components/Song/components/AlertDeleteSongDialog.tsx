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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/stores/useMusicStore";
import { Trash2 } from "lucide-react";

const AlertDeleteSongDialog = ( { songId }: { songId: string }) => {
  const { deleteSong } = useMusicStore();
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="ghost"
          size="sm"
          // onClick={() => deleteAlbum(album._id)}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="m-0 text-[17px] font-medium ">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="mb-5 mt-[15px] text-[15px] leading-normal">
            This action cannot be undone. This will permanently delete your song
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              variant={"ghost"}
              className="inline-flex h-[35px] items-center justify-center rounded bg-mauve3 px-[15px] font-medium leading-none text-mauve11 outline-none outline-offset-1 hover:bg-mauve5 focus-visible:outline-2 focus-visible:outline-mauve7 select-none"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => deleteSong(songId)}
              variant={"destructive"}
              className="inline-flex h-[35px] items-center justify-center rounded bg-red-500 px-[15px] font-medium leading-none text-red-100 outline-none outline-offset-1 hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-900 select-none"
            >
              Continue
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDeleteSongDialog;
