import { useState } from 'react'
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import {
  getUserFacingMessage,
  postJSON,
} from '../../../infrastructure/fetch-json'
import getMeta from '../../../utils/meta'
import { ExposedSettings } from '../../../../../types/exposed-settings'
import useAsync from '../../../shared/hooks/use-async'
import { useUserContext } from '../../../shared/context/user-context'
import ButtonWrapper from '@/features/ui/components/bootstrap-5/wrappers/button-wrapper'
import NotificationWrapper from '@/features/ui/components/bootstrap-5/notification-wrapper'

function AccountInfoSection() {
  const { t } = useTranslation()
  const { hasAffiliationsFeature } = getMeta(
    'ol-ExposedSettings'
  ) as ExposedSettings
  const isExternalAuthenticationSystemUsed = getMeta(
    'ol-isExternalAuthenticationSystemUsed'
  ) as boolean
  const shouldAllowEditingDetails = getMeta(
    'ol-shouldAllowEditingDetails'
  ) as boolean
  const {
    first_name: initialFirstName,
    last_name: initialLastName,
    email: initialEmail,
  } = useUserContext()

  const [email, setEmail] = useState(initialEmail)
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const { isLoading, isSuccess, isError, error, runAsync } = useAsync()
  const [isFormValid, setIsFormValid] = useState(true)

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    setIsFormValid(event.target.validity.valid)
  }

  const handleFirstNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFirstName(event.target.value)
  }

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value)
  }

  const canUpdateEmail =
    !hasAffiliationsFeature && !isExternalAuthenticationSystemUsed
  const canUpdateNames = shouldAllowEditingDetails

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormValid) {
      return
    }
    runAsync(
      postJSON('/user/settings', {
        body: {
          email: canUpdateEmail ? email : undefined,
          first_name: canUpdateNames ? firstName : undefined,
          last_name: canUpdateNames ? lastName : undefined,
        },
      })
    ).catch(() => {})
  }

  return (
    <>
      <h3>{t('update_account_info')}</h3>
      <form id="account-info-form" onSubmit={handleSubmit}>
        {hasAffiliationsFeature ? null : (
          <ReadOrWriteFormGroup
            id="email-input"
            type="email"
            label={t('email')}
            value={email}
            handleChange={handleEmailChange}
            canEdit={canUpdateEmail}
            required
          />
        )}
        <ReadOrWriteFormGroup
          id="first-name-input"
          type="text"
          label={t('first_name')}
          value={firstName}
          handleChange={handleFirstNameChange}
          canEdit={canUpdateNames}
          required={false}
        />
        <ReadOrWriteFormGroup
          id="last-name-input"
          type="text"
          label={t('last_name')}
          value={lastName}
          handleChange={handleLastNameChange}
          canEdit={canUpdateNames}
          required={false}
        />
        {isSuccess ? (
          <FormGroup>
            <NotificationWrapper
              type="success"
              content={t('thanks_settings_updated')}
            />
          </FormGroup>
        ) : null}
        {isError ? (
          <FormGroup>
            <NotificationWrapper
              type="error"
              content={getUserFacingMessage(error) ?? ''}
            />
          </FormGroup>
        ) : null}
        {canUpdateEmail || canUpdateNames ? (
          <ButtonWrapper
            type="submit"
            variant="primary"
            form="account-info-form"
            disabled={!isFormValid}
            isLoading={isLoading}
            bs3Props={{
              loading: isLoading ? `${t('saving')}…` : t('update'),
            }}
          >
            {t('update')}
          </ButtonWrapper>
        ) : null}
      </form>
    </>
  )
}

type ReadOrWriteFormGroupProps = {
  id: string
  type: string
  label: string
  value?: string
  handleChange: (event: any) => void
  canEdit: boolean
  required: boolean
}

function ReadOrWriteFormGroup({
  id,
  type,
  label,
  value,
  handleChange,
  canEdit,
  required,
}: ReadOrWriteFormGroupProps) {
  const [validationMessage, setValidationMessage] = useState('')

  const handleInvalid = (
    event: React.InvalidEvent<HTMLInputElement & FormControl>
  ) => {
    event.preventDefault()
  }

  const handleChangeAndValidity = (
    event: React.ChangeEvent<HTMLInputElement & FormControl>
  ) => {
    handleChange(event)
    setValidationMessage(event.target.validationMessage)
  }

  if (!canEdit) {
    return (
      <FormGroup>
        <ControlLabel htmlFor={id}>{label}</ControlLabel>
        <FormControl id={id} type="text" readOnly value={value} />
      </FormGroup>
    )
  }

  return (
    <FormGroup>
      <ControlLabel htmlFor={id}>{label}</ControlLabel>
      <FormControl
        id={id}
        type={type}
        required={required}
        value={value}
        data-ol-dirty={!!validationMessage}
        onChange={handleChangeAndValidity}
        onInvalid={handleInvalid}
      />
      {validationMessage ? (
        <span className="small text-danger">{validationMessage}</span>
      ) : null}
    </FormGroup>
  )
}

export default AccountInfoSection
