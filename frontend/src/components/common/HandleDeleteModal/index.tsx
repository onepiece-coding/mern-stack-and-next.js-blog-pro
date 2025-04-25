"use client";

import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { memo, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { toast } from "react-toastify";

interface HandleDeleteModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  onDelete: () => Promise<unknown>;
  deletedItem: string;
}

const HandleDeleteModal = memo(
  ({
    openModal,
    setOpenModal,
    onDelete,
    deletedItem = "item",
  }: HandleDeleteModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteHandler = async () => {
      setIsDeleting(true);

      try {
        await onDelete();
        setOpenModal(false);
      } catch {
        toast.error("Failed to delete. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this {deletedItem}?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={deleteHandler}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <Spinner aria-label={`deleting ${deletedItem}...`} />{" "}
                    Loading...
                  </div>
                ) : (
                  "Yes, I'm sure"
                )}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
);

HandleDeleteModal.displayName = "HandleDeleteModal";

export default HandleDeleteModal;
