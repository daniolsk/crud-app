import { useState, useEffect } from 'react';
import type { Campaign, ApiResponse } from './types/Campaign';
import toast, { Toaster } from 'react-hot-toast';
import './styles/main.css';

const API_URL = 'https://crud-app-backend-nine.vercel.app';
const CITIES = ['Krakow', 'Warszawa', 'Gdansk', 'Wroclaw', 'Katowice'];

function App() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [balance, setBalance] = useState<number>(0);
	const [error, setError] = useState<string>('');
	const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		keywords: '',
		bidAmount: '',
		campaignFund: '',
		status: 'active',
		town: '',
		radius: '',
	});

	useEffect(() => {
		fetchCampaigns();
	}, []);

	const fetchCampaigns = async () => {
		try {
			const response = await fetch(`${API_URL}/campaigns`);
			const data: ApiResponse = await response.json();
			setCampaigns(data.campaigns);
			setBalance(data.emeraldAccountBalance);
		} catch {
			setError('Failed to fetch campaigns');
			toast.error('Failed to fetch campaigns');
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const value =
			e.target.type === 'checkbox'
				? (e.target as HTMLInputElement).checked
					? 'active'
					: 'paused'
				: e.target.value;

		setFormData({
			...formData,
			[e.target.name]: value,
		});
	};

	const resetForm = () => {
		setFormData({
			name: '',
			keywords: '',
			bidAmount: '',
			campaignFund: '',
			status: 'active',
			town: '',
			radius: '',
		});
		setEditingCampaign(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		const campaignData = {
			...formData,
			bidAmount: Number(formData.bidAmount),
			campaignFund: Number(formData.campaignFund),
			radius: Number(formData.radius),
		};

		try {
			if (editingCampaign) {
				const response = await fetch(
					`${API_URL}/campaigns/${editingCampaign.id}`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(campaignData),
					}
				);

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message);
				}

				toast.success('Campaign updated successfully');
			} else {
				const response = await fetch(`${API_URL}/campaigns`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(campaignData),
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message);
				}

				toast.success('Campaign created successfully');
			}

			fetchCampaigns();
			resetForm();
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
				toast.error(error.message);
			} else {
				setError('An error occurred while saving the campaign');
				toast.error('An error occurred while saving the campaign');
			}
		}
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(`${API_URL}/campaigns/${id}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete campaign');
			}

			toast.success('Campaign deleted successfully');
			fetchCampaigns();
		} catch {
			setError('Failed to delete campaign');
			toast.error('Failed to delete campaign');
		}
	};

	const handleEdit = (campaign: Campaign) => {
		setEditingCampaign(campaign);
		setFormData({
			name: campaign.name,
			keywords: campaign.keywords,
			bidAmount: campaign.bidAmount.toString(),
			campaignFund: campaign.campaignFund.toString(),
			status: campaign.status,
			town: campaign.town || '',
			radius: campaign.radius.toString(),
		});
	};

	return (
		<div className='container'>
			<header className='header'>
				<h1>Campaign Management</h1>
				<div className='balance'>Balance: {balance} Emeralds</div>
			</header>

			<div className='main'>
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='name'>Campaign Name</label>
						<input
							type='text'
							id='name'
							name='name'
							value={formData.name}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='keywords'>Keywords</label>
						<input
							type='text'
							id='keywords'
							name='keywords'
							placeholder='Enter keywords separated by commas'
							value={formData.keywords}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='bidAmount'>Bid Amount</label>
						<input
							type='number'
							id='bidAmount'
							name='bidAmount'
							min='1'
							value={formData.bidAmount}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='campaignFund'>Campaign Fund</label>
						<input
							type='number'
							id='campaignFund'
							name='campaignFund'
							min='1'
							value={formData.campaignFund}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='status' className='checkbox-label'>
							<input
								type='checkbox'
								id='status'
								name='status'
								checked={formData.status === 'active'}
								onChange={handleInputChange}
							/>
							<span>Status (Is campaign active?)</span>
						</label>
					</div>

					<div className='form-group'>
						<label htmlFor='town'>Town</label>
						<select
							id='town'
							name='town'
							value={formData.town}
							onChange={handleInputChange}
						>
							<option value=''>Select a town</option>
							{CITIES.map((city) => (
								<option key={city} value={city}>
									{city}
								</option>
							))}
						</select>
					</div>

					<div className='form-group'>
						<label htmlFor='radius'>Radius</label>
						<input
							type='number'
							id='radius'
							name='radius'
							min='1'
							value={formData.radius}
							onChange={handleInputChange}
							required
						/>
					</div>

					<button type='submit' className='btn btn-primary'>
						{editingCampaign ? 'Update Campaign' : 'Create Campaign'}
					</button>
					{editingCampaign && (
						<button
							type='button'
							className='btn btn-danger'
							onClick={resetForm}
							style={{ marginLeft: '10px' }}
						>
							Cancel
						</button>
					)}

					{error && <div className='error-message'>{error}</div>}
				</form>

				{campaigns.length == 0 ? (
					<div className='empty-campaigns'>Add a campaign to get started</div>
				) : (
					<div className='campaigns-grid'>
						{campaigns.map((campaign) => (
							<div
								key={campaign.id}
								className={`campaign-card ${
									editingCampaign?.id == campaign.id ? 'active-campaign' : ''
								}`}
							>
								<h3>{campaign.name}</h3>
								<p>Keywords: {campaign.keywords}</p>
								<p>Bid Amount: {campaign.bidAmount}</p>
								<p>Fund: {campaign.campaignFund}</p>
								<p>Status: {campaign.status}</p>
								<p>Town: {campaign.town || 'Not specified'}</p>
								<p>Radius: {campaign.radius} [km]</p>
								<div className='campaign-card-actions'>
									<button
										className='btn btn-primary'
										onClick={() => handleEdit(campaign)}
										style={{ marginRight: '10px' }}
									>
										Edit
									</button>
									<button
										className='btn btn-danger'
										onClick={() => handleDelete(campaign.id)}
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			<Toaster position='top-center' />
		</div>
	);
}

export default App;
