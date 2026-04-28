1.  **Refine `src/lib/db.ts`**:
    -   Implement a `fileToBase64` helper function.
    -   Update `uploadImage` and `uploadFile` to return Base64 strings instead of `URL.createObjectURL`. This ensures that when data is saved to `localStorage`, the files are actually persisted and don't break on page refresh.
    -   Keep the simulation delays to maintain the "real-world" feel.

2.  **Enhance `src/components/features/SendWishesModal.tsx`**:
    -   Improve the attachment UI to show file types or icons more clearly.
    -   Ensure the message sending logic correctly includes the attachments in the saved `Wish` object.
    -   Add a "view" or "preview" capability if possible, or at least ensure the data structure is sound.

3.  **Verify `src/pages/Members.tsx`**:
    -   Ensure all member details are correctly mapped and saved.
    -   Confirm that the "Send Wishes" modal is correctly integrated and receiving all necessary props.

4.  **Final Validation**:
    -   Run `validate_build` to ensure no TypeScript or Vite errors.
    -   Confirm that the "Heritage" theme is preserved.
