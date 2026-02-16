'use client'

import { useState } from 'react'
import { Modal } from '@/components/Modal'

export default function ModalPage() {
  const [visibleModal, setVisibleModal] = useState(false)

  function onModalClose() {
    console.log('Modal closed')
    setVisibleModal(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-heading">Modal page</h1>
        <div className="flex justify-between w-full mb-4">
          <input
            type="text"
            className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand px-3 py-2.5 shadow-xs placeholder:text-body"
            autoFocus={true}
          />
          <button
            className="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none"
            onClick={() => setVisibleModal(true)}
            aria-label="Open contact modal"
          >
            Contact Modal
          </button>
        </div>
        <Modal title="Contact Modal" isOpen={visibleModal} onClose={onModalClose}>
          <form name="contact">
            <label className="mb-2.5 text-sm font-medium text-heading">
              First name
              <input
                type="text"
                name="first_name"
                className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                placeholder="John"
                required
              />
            </label>
            <label className="mb-2.5 text-sm font-medium text-heading">
              Last name
              <input
                type="text"
                name="last_name"
                className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                placeholder="Doe"
                required
              />
            </label>
            <label className="mb-2.5 text-sm font-medium text-heading">
              Company
              <input
                type="text"
                name="company"
                className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                placeholder="Flowbite"
                required
              />
            </label>
            <label className="mb-2.5 text-sm font-medium text-heading">
              Phone number
              <input
                type="tel"
                name="phone"
                className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                placeholder="123-45-678"
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                required
              />
            </label>
            <label className="mb-2.5 text-sm font-medium text-heading">
              Website URL
              <input
                type="url"
                name="website"
                className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                placeholder="example.com"
                required
              />
            </label>
          </form>
        </Modal>
        <p className="mb-6 text-lg font-normal text-justify">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget
          dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes,
          nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis,
          sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec,
          vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
          Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus
          elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu,
          consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat
          a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean
          imperdiet.
        </p>
        <p className="mb-6 text-lg font-normal text-justify">
          Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam
          rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit
          amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar,
          hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut
          libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus
          tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed
          consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a
          libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis
          sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis
          hendrerit fringilla.
        </p>
        <p className="mb-6 text-lg font-normal text-justify">
          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In
          ac dui quis mi consectetuer lacinia. Nam pretium turpis et arcu. Duis arcu tortor,
          suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris.
          Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing.
          Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium
          libero. Cras id dui. Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros,
          ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis
          hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet
          imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit
          quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo.
          Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec
          posuere vulputate arcu. Phasellus accumsan cursus velit.
        </p>
        <p className="mb-6 text-lg font-normal text-justify">
          Aenean tellus metus, bibendum sed, posuere ac, mattis non, nunc. Vestibulum fringilla pede
          sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, tortor
          sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus.
          Donec elit libero, sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis.
          Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec
          pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et
          ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus
          dolor. Maecenas vestibulum mollis
        </p>
      </main>
    </div>
  )
}
