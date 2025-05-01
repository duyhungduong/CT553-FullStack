import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Instrument } from "@/types"; // Giả định bạn có type Instrument trong types
import { Check, X } from "lucide-react"; // Thêm icon Check và X
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

const ShowDetailInstrument = ({ instrument }: { instrument: Instrument }) => {
  const [instrumentDialogOpen, setInstrumentDialogOpen] = useState(false); // Đổi tên biến để đồng bộ với instrument
  const [isEditing, setIsEditing] = useState(false);
  const [editedInstrument, setEditedInstrument] = useState<Instrument>(instrument);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Logic lưu instrument đã chỉnh sửa (có thể gọi API tại đây)
    console.log("Saving edited instrument:", editedInstrument);
    setIsEditing(false);
    // Cập nhật instrument gốc nếu cần: instrument = editedInstrument (thường cần thông qua store hoặc API)
  };

  const handleCancel = () => {
    setEditedInstrument(instrument); // Khôi phục dữ liệu gốc
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Instrument
  ) => {
    setEditedInstrument({ ...editedInstrument, [field]: e.target.value });
  };

  return (
    <Dialog open={instrumentDialogOpen} onOpenChange={setInstrumentDialogOpen}>
      <DialogTrigger asChild>
        <span className="font-medium cursor-pointer text-fuchsia-400 hover:text-fuchsia-600 transition-colors duration-200">
          {instrument.name}
        </span>
      </DialogTrigger>
      <AnimatePresence>
        {instrumentDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
              <DialogHeader className="border-b border-zinc-700/50 pb-4">
                <DialogTitle className="text-2xl font-bold text-white">
                  {instrument.name}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Explore and edit the details of {instrument.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Section - Image */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <img
                      src={instrument.imageUrl}
                      alt={instrument.name}
                      className="w-full max-w-sm h-auto object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                </div>

                {/* Right Section - Details */}
                <div className="space-y-6 overflow-y-auto max-h-[60vh]">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Name
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedInstrument.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium text-zinc-300 w-24 shrink-0">
                      Family
                    </Label>
                    <Input
                      disabled={!isEditing}
                      value={editedInstrument.family || "Unknown"}
                      onChange={(e) => handleInputChange(e, "family")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-zinc-300">
                      Description
                    </Label>
                    <Textarea
                      disabled={!isEditing}
                      value={editedInstrument.description || "No description available"}
                      onChange={(e) => handleInputChange(e, "description")}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white h-32 resize-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-700/50 p-4 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setInstrumentDialogOpen(false)}
                      className="bg-transparent border-zinc-600 text-white hover:bg-zinc-700/50 transition-all duration-200"
                    >
                      Close
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ShowDetailInstrument;