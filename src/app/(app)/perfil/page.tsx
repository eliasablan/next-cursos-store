import React from "react";

import SendVerificationEmailForm from "./_components/SendVerificationEmailForm";
import UpdateProfileForm from "./_components/UpdateUserForm";

export default function Profile() {
  return (
    <>
      <UpdateProfileForm />
      <SendVerificationEmailForm />
    </>
  );
}
