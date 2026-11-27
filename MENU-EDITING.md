# Publishing the BGM menu

## One-time owner setup

1. After this change reaches `main`, sign in to [Pages CMS](https://app.pagescms.org/) with the GitHub account that manages `swathiarbi/thebgm`. Install the Pages CMS GitHub App, choose **Only select repositories**, and grant it access to **swathiarbi/thebgm**.
2. Open [the restaurant editor](https://app.pagescms.org/swathiarbi/thebgm/main) and select **main**. The menu form and media folder come from the repository’s `.pages.yml`.
3. Open **Collaborators** for this repository, add the restaurant owner’s email and send the invitation. The owner follows the email link and signs in using the invited address.
4. In the existing Vercel project for **thebgm.vercel.app**, check that **Settings → Git** connects to **swathiarbi/thebgm** and that **main** is the production branch. A CMS save commits the change. Vercel publishes it after the production build succeeds. If the repository requires review, edit on a separate branch and merge its pull request after review.

## Everyday edits

- Open **Menu categories** to add a category, edit its shared photo, adjust its order or hide it. Hiding a category also hides its dishes. Reassign its dishes before deleting a category.
- Open **Menu dishes**, expand a dish, choose its category by name, then edit its details. Enter the price in rupees. **Available to order** controls the cart button. **Feature on homepage** selects a dish for the existing six-card homepage section.
- Upload a JPG, PNG, WebP or AVIF in the photo field. The editor stores the file in `public/images/menu/` and writes its public URL starting with `/images/menu/`. Clear a dish photo to inherit its category photo. Cards using that fallback carry a **Shared photo** label.
- Smaller display-order numbers appear first. Existing IDs connect saved carts to the current dish and prices. Keep permanent IDs and existing category slugs when renaming entries.
- Save and wait for the associated Vercel deployment. Open the public menu in a fresh tab and check the dish, price and photo. Public browsing reads the deployed catalog and images. Owner access and GitHub permissions are configured in Pages CMS.

The dashboard links menu management to this editor. Other dashboard tools continue to use the restaurant’s configured Supabase login.
