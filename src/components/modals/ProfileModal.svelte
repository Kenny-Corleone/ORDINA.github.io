<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { userStore } from '../../lib/stores/userStore';
  import { auth } from '../../lib/firebase';
  import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
  
  const dispatch = createEventDispatcher();
  
  // Get user data from store
  $: userProfile = $userStore.userProfile;
  $: user = auth.currentUser;
  
  // Form state for profile update
  let displayName = userProfile?.displayName || '';
  let isEditingProfile = false;
  let profileError = '';
  let profileSuccess = '';
  let isSubmittingProfile = false;
  
  // Form state for password change
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let isChangingPassword = false;
  let passwordError = '';
  let passwordSuccess = '';
  let isSubmittingPassword = false;
  
  // Initialize display name when user profile changes
  $: if (userProfile?.displayName) {
    displayName = userProfile.displayName;
  }
  
  // Start editing profile
  function startEditProfile() {
    isEditingProfile = true;
    displayName = userProfile?.displayName || '';
    profileError = '';
    profileSuccess = '';
  }
  
  // Cancel editing profile
  function cancelEditProfile() {
    isEditingProfile = false;
    displayName = userProfile?.displayName || '';
    profileError = '';
    profileSuccess = '';
  }
  
  // Save profile changes
  async function saveProfile() {
    if (!user) {
      profileError = 'User not authenticated';
      return;
    }
    
    const name = displayName.trim();
    if (!name) {
      profileError = 'Display name cannot be empty';
      return;
    }
    
    isSubmittingProfile = true;
    profileError = '';
    profileSuccess = '';
    
    try {
      await updateProfile(user, { displayName: name });
      
      // Update user store
      userStore.setUserProfile({
        ...userProfile!,
        displayName: name,
      });
      
      profileSuccess = 'Profile updated successfully!';
      isEditingProfile = false;
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        profileSuccess = '';
      }, 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      profileError = error.message || 'Failed to update profile. Please try again.';
    } finally {
      isSubmittingProfile = false;
    }
  }
  
  // Start changing password
  function startChangePassword() {
    isChangingPassword = true;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordError = '';
    passwordSuccess = '';
  }
  
  // Cancel changing password
  function cancelChangePassword() {
    isChangingPassword = false;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordError = '';
    passwordSuccess = '';
  }
  
  // Change password
  async function changePassword() {
    if (!user || !user.email) {
      passwordError = 'User not authenticated';
      return;
    }
    
    // Validate inputs
    if (!currentPassword) {
      passwordError = 'Please enter your current password';
      return;
    }
    
    if (!newPassword) {
      passwordError = 'Please enter a new password';
      return;
    }
    
    if (newPassword.length < 6) {
      passwordError = 'New password must be at least 6 characters';
      return;
    }
    
    if (newPassword !== confirmPassword) {
      passwordError = 'New passwords do not match';
      return;
    }
    
    if (currentPassword === newPassword) {
      passwordError = 'New password must be different from current password';
      return;
    }
    
    isSubmittingPassword = true;
    passwordError = '';
    passwordSuccess = '';
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      passwordSuccess = 'Password changed successfully!';
      isChangingPassword = false;
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        passwordSuccess = '';
      }, 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        passwordError = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        passwordError = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        passwordError = 'Please log out and log in again before changing your password';
      } else {
        passwordError = error.message || 'Failed to change password. Please try again.';
      }
    } finally {
      isSubmittingPassword = false;
    }
  }
  
  // Handle close
  function handleClose() {
    dispatch('close');
  }
  
  // Check if user signed in with password (not OAuth)
  $: isPasswordUser = user?.providerData.some(provider => provider.providerId === 'password') || false;
</script>

<div class="profile space-y-6">
  <!-- User Info -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Account Information</h3>
    <div class="space-y-3">
      <!-- Email -->
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">Email</div>
        <div class="text-gray-900 dark:text-white font-medium mt-1">
          {userProfile?.email || 'Not available'}
        </div>
      </div>
      
      <!-- User ID -->
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">User ID</div>
        <div class="text-gray-900 dark:text-white font-mono text-sm mt-1 break-all">
          {userProfile?.uid || 'Not available'}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Display Name -->
  <div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Display Name</h3>
    {#if isEditingProfile}
      <div class="space-y-2">
        <input
          type="text"
          bind:value={displayName}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter display name"
          disabled={isSubmittingProfile}
        />
        {#if profileError}
          <p class="text-sm text-red-600 dark:text-red-400">{profileError}</p>
        {/if}
        <div class="flex gap-2">
          <button
            type="button"
            on:click={saveProfile}
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={isSubmittingProfile}
          >
            {isSubmittingProfile ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            on:click={cancelEditProfile}
            class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            disabled={isSubmittingProfile}
          >
            Cancel
          </button>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div class="text-gray-900 dark:text-white font-medium">
            {userProfile?.displayName || 'Not set'}
          </div>
          {#if !userProfile?.displayName}
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add a display name to personalize your profile
            </div>
          {/if}
        </div>
        <button
          type="button"
          on:click={startEditProfile}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>
      {#if profileSuccess}
        <p class="text-sm text-green-600 dark:text-green-400 mt-2">{profileSuccess}</p>
      {/if}
    {/if}
  </div>
  
  <!-- Change Password (only for email/password users) -->
  {#if isPasswordUser}
    <div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Change Password</h3>
      {#if isChangingPassword}
        <form on:submit|preventDefault={changePassword} class="space-y-3">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              bind:value={currentPassword}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter current password"
              disabled={isSubmittingPassword}
              required
            />
          </div>
          
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              bind:value={newPassword}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter new password (min 6 characters)"
              disabled={isSubmittingPassword}
              required
            />
          </div>
          
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              bind:value={confirmPassword}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Confirm new password"
              disabled={isSubmittingPassword}
              required
            />
          </div>
          
          {#if passwordError}
            <p class="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
          {/if}
          
          <div class="flex gap-2">
            <button
              type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? 'Changing...' : 'Change Password'}
            </button>
            <button
              type="button"
              on:click={cancelChangePassword}
              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              disabled={isSubmittingPassword}
            >
              Cancel
            </button>
          </div>
        </form>
      {:else}
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Update your password to keep your account secure.
          </p>
          <button
            type="button"
            on:click={startChangePassword}
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Change Password
          </button>
        </div>
        {#if passwordSuccess}
          <p class="text-sm text-green-600 dark:text-green-400 mt-2">{passwordSuccess}</p>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
      <p class="text-sm text-blue-700 dark:text-blue-300">
        You signed in with Google. Password changes are managed through your Google account.
      </p>
    </div>
  {/if}
  
  <!-- Info message -->
  <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
    <p class="text-sm text-blue-700 dark:text-blue-300">
      Your profile information is stored securely in Firebase. Changes are saved immediately.
    </p>
  </div>
  
  <!-- Close button -->
  <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      on:click={handleClose}
      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    >
      Close
    </button>
  </div>
</div>
