import { createClient } from "@/lib/supabase/client"

export class StorageService {
  private supabase = createClient()
  private bucketName = "menu-photos"

  async uploadMenuPhoto(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error uploading photo:", error)
      throw error
    }
  }

  async uploadBase64Photo(base64Data: string, userId: string): Promise<string> {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(base64Data)
      const blob = await base64Response.blob()
      
      // Create file from blob
      const file = new File([blob], `menu-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      return await this.uploadMenuPhoto(file, userId)
    } catch (error) {
      console.error("Error uploading base64 photo:", error)
      throw error
    }
  }

  async deleteMenuPhoto(photoUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const userId = urlParts[urlParts.length - 2]
      const filePath = `${userId}/${fileName}`

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error("Error deleting photo:", error)
      throw error
    }
  }

  async getPhotoUrl(filePath: string): Promise<string> {
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Helper method to compress image before upload
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const newWidth = img.width * ratio
        const newHeight = img.height * ratio

        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

export const storage = new StorageService() 