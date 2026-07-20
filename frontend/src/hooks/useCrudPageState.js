import { useState } from 'react'

export function useCrudPageState() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  const closeCreate = () => setIsCreateOpen(false)

  const openCreate = () => setIsCreateOpen(true)

  const clearSelection = () => setSelectedItem(null)

  const requestDelete = (item) => setItemToDelete(item)

  const cancelDelete = () => setItemToDelete(null)

  const completeDelete = () => {
    setItemToDelete(null)
    setSelectedItem(null)
  }

  return {
    isCreateOpen,
    setIsCreateOpen,
    openCreate,
    closeCreate,
    selectedItem,
    setSelectedItem,
    clearSelection,
    itemToDelete,
    setItemToDelete,
    requestDelete,
    cancelDelete,
    completeDelete,
  }
}
