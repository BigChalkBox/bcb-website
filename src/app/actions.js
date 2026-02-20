'use server'

export async function submitPilotProgram(formData) {
    const rawFormData = {
        fullName: formData.get('fullName'),
        institution: formData.get('institution'),
        role: formData.get('role'),
        email: formData.get('email'),
    }

    // In a real application, you would save this to a database or send an email.
    console.log('Pilot Program Submission:', rawFormData)

    return { success: true, message: 'Pilot program inquiry submitted successfully!' }
}
